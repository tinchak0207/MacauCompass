1.新成立公司
基本信息數據集字段API信息
|基本信息
摘要	
由一名或多名股東組織而成，並按法定程序完成註冊及登記之公司。
開放條件	完全開放
數據分類	
創業及營商

數據格式	
JSON
提供部門/實體	統計暨普查局
提供部門/實體聯絡電話	(853) 8399 5311
提供部門/實體聯絡電郵	info@dsec.gov.mo
更新頻率	每月
目錄API	https://api.data.gov.mo/document/download/094324ef-45cb-4d5f-9004-77e6d82c1042?token=ZsJvwp4NMUMAsFeXeFoX3nhw0SBhmBYD&isNeedFile=0&lang=TC
 下載次數：301 瀏覽次數：612
 最後更新時間：2024-12-30 16:54:24 首次發佈時間：2019-05-09 11:25:43
| 數據集字段 
字段名稱	字段類型	字段長度	字段描述（繁體中文）	字段描述（簡體中文）	字段描述（英文）字段描述（葡萄牙文）
title	string	200	指標名稱	指标名称	Indicator nameNome do indicador
unit	string	200	數據單位	数据单位	UnitUnidade dos dados
maxYear	number	-	數據能獲取的最大年份	数据能获取的最大年份	Latest year of available dataAno limite de fim do período para pesquisar dados
minYear	number	-	數據能獲取的最小年份	数据能获取的最小年份	Earliest year of available data　Ano limite de início do período para pesquisar dados
periodType	string	200	數據周期類型	数据周期类型	PeriodicityTipo de periodicidade
indicatorRemarks	array[string]	-	指標備註	指标备注	Indicator remarksObservações do indicador
values	array[object]	-	數據集	数据集	DatasetConjunto temático de dados
value	number	-	數據值	数据值	Data valueValor dos dados
periodString	string	200	數據周期	数据周期	PeriodPeríodo dos dados
remarks	array[string]	-	數據備註	数据备注	Data remarksObservações dos dados
| API信息
新成立公司
API名稱	新成立公司
請求方式	POST
返回類型	JSON
調用地址	https://dsec.apigateway.data.gov.mo/public/KeyIndicator/NewlyIncorporatedCompanies
接口描述	創業及營商 - 新成立公司
請求頭請求參數正常返回示例異常返回示例錯誤碼定義
key
value
摘要
Authorization	
APPCODE 09d43a591fba407fb862412970667de4 
調用api必填參數

2.商標註冊申請量
基本信息數據集字段檔案下載
|基本信息
摘要	
按每月方式，提供商標註冊申請統計資料
開放條件	完全開放
數據分類	
創業及營商

數據格式	
CSV
提供部門/實體	經濟及科技發展局
提供部門/實體聯絡電話	(853) 2888 2088
提供部門/實體聯絡電郵	info@dsedt.gov.mo
更新頻率	每月
目錄API	https://api.data.gov.mo/document/download/8ff5d0ef-235c-4847-a4ca-0f9d5b515bb6?token=ZsJvwp4NMUMAsFeXeFoX3nhw0SBhmBYD&isNeedFile=0&lang=TC
 下載次數：151 瀏覽次數：265
 最後更新時間：2025-11-21 09:39:57 首次發佈時間：2020-09-16 12:08:44
| 數據集字段 
字段名稱	字段類型	字段長度	字段描述（繁體中文）	字段描述（簡體中文）	字段描述（英文）字段描述（葡萄牙文）
Year	int	4	年	年	YearAno
Month	int	2	月	月	MonthMês
Quantity	int	6	數量	數量	QuantityQuantidade

3.物業按揭貸款
基本信息數據集字段檔案下載
|基本信息
摘要	
由2008年至今的物業按揭貸款統計數據。當中，新批核住宅按揭貸款、樓花按揭貸款、未償還住宅按揭貸款總額、新批核商用物業貸款、未償還商用物業貸款總額可分為居民及非居民。撇帳比率及貸款拖欠比率可按住宅按揭貸款及商用物業貸款劃分。

開放條件	完全開放
數據分類	
創業及營商

數據格式	
XLSXLSX
提供部門/實體	澳門金融管理局
提供部門/實體聯絡電話	金融管理局/83952532
提供部門/實體聯絡電郵	金融管理局/dee@amcm.gov.mo
更新頻率	每月
目錄API	https://api.data.gov.mo/document/download/c9702d30-d796-4666-8645-4614cb25994f?token=ZsJvwp4NMUMAsFeXeFoX3nhw0SBhmBYD&isNeedFile=0&lang=TC
 下載次數：151 瀏覽次數：64
 最後更新時間：2025-11-14 17:00:09 首次發佈時間：2022-10-28 17:55:37
| 數據集字段 
字段名稱	字段類型	字段長度	字段描述（繁體中文）	字段描述（簡體中文）	字段描述（英文）字段描述（葡萄牙文）
year	-	-	年份	年份	YearAno
quarter	-	-	季度	季度	QuarterTrimestre
month	-	-	月份	月份	MonthMês
newResidentialMortgageLoansApprovedTotal	-	-	新批核住宅按揭貸款（千澳門元）-總額	新批核住宅按揭贷款（千澳门元）-总额	New Residential Mortgage Loans Approved (MOP thousand)-TotalNovos Empréstimos Hipotecários para Habitação Aprovados (MOP mil)-Total
newResidentialMortgageLoansApprovedResidents	-	-	新批核住宅按揭貸款（千澳門元）-居民	新批核住宅按揭贷款（千澳门元）-居民	New Residential Mortgage Loans Approved (MOP thousand)-ResidentsNovos Empréstimos Hipotecários para Habitação Aprovados (MOP mil)-Residentes
newResidentialMortgageLoansApprovedNonResidents	-	-	新批核住宅按揭貸款（千澳門元）-非居民	新批核住宅按揭贷款（千澳门元）-非居民	New Residential Mortgage Loans Approved (MOP thousand)-Non ResidentsNovos Empréstimos Hipotecários para Habitação Aprovados (MOP mil)-Não Residentes
newResidentialMortgageLoansApprovedEquitableMortgageTotal	-	-	新批核樓花按揭貸款（千澳門元）-總額	新批核楼花按揭贷款（千澳门元）-总额	New Equitable Mortgage Loans Approved (MOP thousand)-TotalNovos empréstimos hipotecários para alienação de fracções autónomas em edifícios em construção Aprovados (MOP mil)-Total
newResidentialMortgageLoansApprovedEquitableMortgageResidents	-	-	新批核樓花按揭貸款（千澳門元）-居民	新批核楼花按揭贷款（千澳门元）-居民	New Equitable Mortgage Loans Approved (MOP thousand)-ResidentsNovos empréstimos hipotecários para alienação de fracções autónomas em edifícios em construção Aprovados (MOP mil)-Residentes
newResidentialMortgageLoansApprovedEquitableMortgageNonResidents	-	-	新批核樓花按揭貸款（千澳門元）-非居民	新批核楼花按揭贷款（千澳门元）-非居民	New Equitable Mortgage Loans Approved (MOP thousand)-Non ResidentsNovos empréstimos hipotecários para alienação de fracções autónomas em edifícios em construção Aprovados (MOP mil)-Não Residentes
grossOutstandingRMLsTotal	-	-	未償還住宅按揭貸款（千澳門元）-總額	未偿还住宅按揭贷款（千澳门元）-总额	Gross Outstanding RMLs (MOP thousand)-TotalSaldo Bruto dos EHHs (MOP mil)-Total
grossOutstandingRMLsResidents	-	-	未償還住宅按揭貸款（千澳門元）-居民	未偿还住宅按揭贷款（千澳门元）-居民	Gross Outstanding RMLs (MOP thousand)-ResidentsSaldo Bruto dos EHHs (MOP mil)-Residentes
grossOutstandingRMLsNonResidents	-	-	未償還住宅按揭貸款（千澳門元）-非居民	未偿还住宅按揭贷款（千澳门元）-非居民	Gross Outstanding RMLs (MOP thousand)-NonResidentsSaldo Bruto dos EHHs (MOP mil)-Não Residentes
rMLsWriteOffRatio	-	-	住宅按揭貸款撇帳比率(%)	住宅按揭贷款撇帐比率(%)	RMLs Write Off Ratio(%)Os Níveis dos Empréstimos Dívidados dos EHHs em % do Saldo Bruto dos EHHs (%)
newCommercialRealEstateLoansApprovedTotal	-	-	新批核商用物業貸款（千澳門元）-總額	新批核商用物业贷款（千澳门元）-总额	New Commercial Real Estate Loans Approved(MOP thousand)-TotalNovos Empréstimos Comerciais para Actividades Imobiliárias Aprovados (MOP mil)-Total
newCommercialRealEstateLoansApprovedResidents	-	-	新批核商用物業貸款（千澳門元）-居民	新批核商用物业贷款（千澳门元）-居民	New Commercial Real Estate Loans Approved(MOP thousand)-ResidentsNovos Empréstimos Comerciais para Actividades Imobiliárias Aprovados (MOP mil)-Residentes
newCommercialRealEstateLoansApprovedNonResidents	-	-	新批核商用物業貸款（千澳門元）-非居民	新批核商用物业贷款（千澳门元）-非居民	New Commercial Real Estate Loans Approved(MOP thousand)-Non ResidentsNovos Empréstimos Comerciais para Actividades Imobiliárias Aprovados (MOP mil)-Não Residentes
grossOutstandingCRELsTotal	-	-	未償還商用物業貸款（千澳門元）-總額	未偿还商用物业贷款（千澳门元）-总额	Gross Outstanding CRELs (MOP thousand)-TotalSaldo Bruto dos ECAIs (MOP mil)-Total
grossOutstandingCRELsResidents	-	-	未償還商用物業貸款（千澳門元）-居民	未偿还商用物业贷款（千澳门元）-居民	Gross Outstanding CRELs (MOP thousand)-ResidentsSaldo Bruto dos ECAIs (MOP mil)-Residentes
grossOutstandingCRELsNonResidents	-	-	未償還商用物業貸款（千澳門元）-非居民	未偿还商用物业贷款（千澳门元）-非居民	Gross Outstanding CRELs (MOP thousand)-Non ResidentsSaldo Bruto dos ECAIs (MOP mil)-Não Residentes
cRELsWriteOffRatio	-	-	商用物業貸款撇帳比率(%)	商用物业贷款撇帐比率(%)	CRELs Write Off Ratio(%)Os Níveis de Empréstimos Não Pagos dos ECAIs em % do Saldo Bruto dos ECAIs (%)
delinquencyRatiosTotal	-	-	貸款拖欠比率 (%)-總額	贷款拖欠比率 (%)-总额	Delinquency Ratios(%)-TotalRácio das Dívidas Não Pagas (%)-Total
delinquencyRatiosRMLs	-	-	貸款拖欠比率 (%)-住宅按揭貸款	贷款拖欠比率 (%)-住宅按揭贷款	Delinquency Ratios(%)-RMLsRácio das Dívidas Não Pagas (%)-EHHs
delinquencyRatiosCRELs	-	-	貸款拖欠比率 (%)-商用物業貸款	贷款拖欠比率 (%)-商用物业贷款	Delinquency Ratios(%)-CRELsRácio das Dívidas Não P