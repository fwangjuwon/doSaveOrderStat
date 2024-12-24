/** 주문이력-버튼 클릭- 배송완료처리 - 관련(주문) 상태 코드 배송완료 처리 */
public int doSaveOrderDtlReltStatCd150(DataSetMap tranInfoMap, Map inVariableMap, Map inDataSetMap, Map ouVariableMap,
        Map outDataSetMap) throws Exception {

    DataSetMap list = (DataSetMap) inDataSetMap.get("dsOrderDtl");

    java.text.SimpleDateFormat formater = new java.text.SimpleDateFormat("yyyyMMdd");
    Date current = new Date();
    String date = formater.format(current);
    java.util.Date date1 = formater.parse((String) date);
    String strOrderNum = "";

    List<Map> listRecordsOrderLock = null;

    for (int i = 0; i < list.size(); i++) {

        Map map = list.get(i);

        // Lock 조회 중복 프로세스 처리 안되게 하기 위한 추가 20150429
        list.get(0).put("gubun", "lockValidChk");
        listRecordsOrderLock = SVOR0102010DAO.selectOrderLockCd(list.get(0));
        // listRecordsOrderLock = commonDAO.list("SVOR0302040.selectOrderList",
        // list.get(0));// 2015-12-29 기능수정

        if (listRecordsOrderLock.size() > 0) {
            throw new BizException("-1", "OR0102010_016",
                    new String[] { StringUtil.nvl(listRecordsOrderLock.get(0).get("orderLockCd")) });
        }

        if ("1".equals(map.get("choiceGub").toString())) {
            strOrderNum = map.get("orderNum").toString();

            SVOR0101010DAO.SaveOrderDtlReltStatCd150(map); // 주문DTL상태변경
            map.put("userId", StringUtil.nvl(map.get("finalRvisPic")));
            SVOR0101010DAO.insertOrderDtlStatHst_Rtn(map); // 주문 상세 상태 이력 Insert

            SVOR0101010DAO.SaveOutGoGthrReltStatCd150(map); // 출고수거기본상태변경
            SVOR0101010DAO.SaveOutGoGthrDtlDlvrEndDate(map); // 출고수거상세배송완료일 출고수거기본의 매출일자로 업데이트 처리 20150923

            List<Map> orRecordsOutgoGthrNum = null;
            orRecordsOutgoGthrNum = SVOR0102010DAO.selectSVOR0102010List_OutgoGthrNum(map);
            /***********************************************
             * 2020-03-17 배송완료 후 출고수거 처리 NSSR-36727 backendorder_TIS > 상담원 수기 배송완료처리시, 제휴물류
             * 데이터 전달 요청
             ***********************************************/
            if (orRecordsOutgoGthrNum.size() > 0) {
                for (int j = 0; j < orRecordsOutgoGthrNum.size(); j++) {
                    map.put("outgoGthrNum",
                            Long.parseLong(orRecordsOutgoGthrNum.get(j).get("outgoGthrNum").toString()));
                    map.put("rtnCode", ""); // out 변수
                    map.put("rtnMsg", ""); // out 변수

                    SVOR0102010DAO.SelectOutgoGthrHstInsert(map);

                    if (!"00".equals(map.get("rtnCode").toString())) {
                        throw new BizException("-1", "OR0101010_012",
                                new String[] { StringUtil.nvl(map.get("rtnCode")) });
                    }
                }
            }
            /***********************************************
             * 2014-03-12 Order to Front Interface
             ***********************************************/
            // Map map1 = list.get(i);
            Map paramIfMap = new HashMap();

            paramIfMap.put("an_rtn_code", 0); // out 변수
            paramIfMap.put("av_rtn_msg", ""); // out 변수
            paramIfMap.put("ad_occur_date", (String) date);
            paramIfMap.put("an_order_num", strOrderNum.toString());
            paramIfMap.put("an_work_gbn", "90");

            SVOR0101010DAO.SelectOrInterface(paramIfMap);

            if (!"0".equals(paramIfMap.get("an_rtn_code").toString())) {
                // throw new BizException("-1",messageUtil.resolveMessage("OR0101010_012",
                // null)+"(code:"+paramIfMap.get("an_rtn_code").toString()+")",null);
                throw new BizException("-1", "OR0101010_012",
                        new String[] { StringUtil.nvl(paramIfMap.get("an_rtn_code")) });
            }

            /***********************************************
             ***********************************************/
        }
    }

    // 주문 이력 조회
    DataSetMap list1 = (DataSetMap) inDataSetMap.get("dsInqryOrderDtl");

    List<Map> orRecords = null;

    orRecords = SVOR0101010DAO.selectSVOR0102010List_OrderDtl(list1.get(0));

    DataSetMap dsMap = new DataSetMap();
    dsMap.setRowMaps(orRecords);
    outDataSetMap.put("dsOrderDtl", dsMap);
    // 2016.11.24 주문량이 많은 경우 DB SELECT LOCK을 유발하여 주문 접수 지연이 발생 할 수 있어서 임의로 Commit처리를
    // 진행해야됨. 절대 지우지 말것
    SVOR0101010DAO.spOrCommit();
    return 0;

}