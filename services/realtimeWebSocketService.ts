import { ParkingSpaceData, WeatherData, BorderCrossingData } from '../types';

type WebSocketCallback = (data: any) => void;

interface RealtimeSubscription {
  dataType: 'parking' | 'weather' | 'border' | 'flight';
  callback: WebSocketCallback;
  id: string;
}

class RealtimeWebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;

  constructor(wsUrl: string = 'ws://localhost:8080/realtime') {
    this.url = wsUrl;
  }

  /**
   * 连接到 WebSocket 服务器
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ [WebSocket] 连接成功');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('❌ [WebSocket] 连接错误:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('⚠️ [WebSocket] 连接关闭');
          this.isConnecting = false;
          this.attemptReconnect();
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting && this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws?.close();
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 断线重连
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;

      console.log(`🔄 [WebSocket] 将在 ${delay}ms 后重新连接 (尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch(error => {
          console.error('🔄 [WebSocket] 重连失败:', error);
        });
      }, delay);
    } else {
      console.error('❌ [WebSocket] 已达到最大重连尝试次数');
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(rawData: string) {
    try {
      const message = JSON.parse(rawData);
      const { type, data } = message;

      // 分发给所有相关的订阅者
      this.subscriptions.forEach((subscription, id) => {
        if (subscription.dataType === type) {
          try {
            subscription.callback(data);
          } catch (error) {
            console.error(`❌ [WebSocket] 回调函数执行失败 (${id}):`, error);
          }
        }
      });
    } catch (error) {
      console.error('❌ [WebSocket] 消息解析失败:', error);
    }
  }

  /**
   * 订阅实时数据
   */
  subscribe(
    dataType: 'parking' | 'weather' | 'border' | 'flight',
    callback: WebSocketCallback
  ): string {
    const id = `${dataType}_${Date.now()}_${Math.random()}`;

    this.subscriptions.set(id, {
      dataType,
      callback,
      id
    });

    console.log(`📡 [WebSocket] 已订阅 ${dataType} (ID: ${id})`);

    // 发送订阅请求到服务器
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        type: 'subscribe',
        dataType
      });
    }

    return id;
  }

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription) {
      this.subscriptions.delete(subscriptionId);
      console.log(`❌ [WebSocket] 已取消订阅 (ID: ${subscriptionId})`);

      // 如果没有更多该类型的订阅，通知服务器
      const hasMoreOfType = Array.from(this.subscriptions.values()).some(
        s => s.dataType === subscription.dataType
      );

      if (!hasMoreOfType && this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'unsubscribe',
          dataType: subscription.dataType
        });
      }

      return true;
    }

    return false;
  }

  /**
   * 发送消息到服务器
   */
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ [WebSocket] WebSocket 未连接，无法发送消息');
    }
  }

  /**
   * 获取连接状态
   */
  getStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    if (!this.ws) return 'CLOSED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'CLOSED';
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    console.log('🔌 [WebSocket] 已断开连接');
  }

  /**
   * 获取订阅统计
   */
  getSubscriptionStats() {
    const stats: Record<string, number> = {
      parking: 0,
      weather: 0,
      border: 0,
      flight: 0
    };

    this.subscriptions.forEach(subscription => {
      stats[subscription.dataType]++;
    });

    return {
      total: this.subscriptions.size,
      byType: stats,
      status: this.getStatus()
    };
  }
}

// 创建全局单例
let wsManager: RealtimeWebSocketManager | null = null;

export const getRealtimeManager = (wsUrl?: string): RealtimeWebSocketManager => {
  if (!wsManager) {
    wsManager = new RealtimeWebSocketManager(wsUrl);
  }
  return wsManager;
};

/**
 * 启动 WebSocket 连接（带降级策略）
 */
export const initializeRealtimeData = async (
  wsUrl?: string
): Promise<{ success: boolean; error?: string }> => {
  const manager = getRealtimeManager(wsUrl);

  try {
    await manager.connect();
    console.log('✅ [Realtime] WebSocket 已初始化');
    return { success: true };
  } catch (error) {
    console.warn('⚠️ [Realtime] WebSocket 初始化失败，将使用 HTTP 轮询降级方案:', error);

    // 启动 HTTP 轮询降级
    startPollingFallback();

    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * HTTP 轮询降级方案
 */
const pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

export const startPollingFallback = () => {
  console.log('🔄 [Realtime] 启动 HTTP 轮询降级方案');

  // 每 30 秒更新一次停车位数据
  const parkingPollId = setInterval(async () => {
    try {
      const response = await fetch(
        'https://api.data.gov.mo/document/download/ea50a770-cc35-47cc-a3ba-7f60092d4bc4?lang=TC&format=json'
      );
      if (response.ok) {
        const data = await response.json();
        // 分发给订阅者
        const manager = getRealtimeManager();
        manager['handleMessage'](JSON.stringify({ type: 'parking', data }));
      }
    } catch (error) {
      console.error('❌ [Polling] 停车位数据获取失败:', error);
    }
  }, 30000);

  pollingIntervals.set('parking', parkingPollId);

  // 每 10 分钟更新一次天气数据
  const weatherPollId = setInterval(async () => {
    try {
      const response = await fetch(
        'https://api.data.gov.mo/document/download/a56e346b-5314-4157-965c-360df113065a?lang=TC&format=json'
      );
      if (response.ok) {
        const data = await response.json();
        const manager = getRealtimeManager();
        manager['handleMessage'](JSON.stringify({ type: 'weather', data }));
      }
    } catch (error) {
      console.error('❌ [Polling] 天气数据获取失败:', error);
    }
  }, 600000);

  pollingIntervals.set('weather', weatherPollId);
};

export const stopPollingFallback = () => {
  console.log('⛔ [Polling] 停止轮询降级方案');

  pollingIntervals.forEach((intervalId, key) => {
    clearInterval(intervalId);
    pollingIntervals.delete(key);
  });
};
