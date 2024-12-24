switch (obj.name) {
    case "btnOrderHstDlvrStatRvis" :
    // 배송 상태 변경 (150	배송완료처리)
        divBody.divOrderHst.txtSelectRow.value = cRow;  // 현재 Row 저장

        //멀티체크가 가능하므로 체크가 되어있지 않은 경우에만 현재 선택한 로우를 체크처리한다.
        if(dsOrderDtl.getCaseCount("choiceGub == '1'") == 0){
            dsOrderDtl.enableevent = false;
            dsOrderDtl.setColumn(cRow, "choiceGub", "1");
            dsOrderDtl.enableevent = true;
        }

        //첫번째 체크 인덱스 기준 처리
        var choiceIndx = dsOrderDtl.findRow("choiceGub", "1");

        //정기배송여부
        var beforePriodDlvrGoodsYn = dsOrderDtl.getColumn(choiceIndx, "priodDlvrGoodsYn");

        var orderNum = dsOrderDtl.getColumn(choiceIndx, "orderNum");
        var pStatCd = "100;110;120;130;140;;";
        var pVal = pStatCd.indexOf(dsOrderDtl.getColumn(choiceIndx, "reltStatCd"));
        var chcOrPrtOrderSeq = null;
        
        function fnReset(
            dsOrderDtl.enableevent = false;
            dsOrderDtl.reset();
            dsOrderDtl.enableevent = true;
            return false;
        );

        //validation 체크
        for(var i = choiceIndx ; i<dsOrderDtl.rowcount; i++){
            if(dsOrderDtl.getColumn(i, "orderNum") <> orderNum ){
                break;
            }

            if(dsOrderDtl.getColumn(i, "choiceGub")==1 && dsOrderDtl.getColumn(choiceIndx, "goodsTypeCd").substr(2, 1) == "L" || dsOrderDtl.getColumn(choiceIndx, "partialTypeCd") == "PRL"){
                fnReset();
                return false;
            }
            if(dsOrderDtl.getColumn(i, "choiceGub") ==1 && dsOrderDtl.getColumn(i, "reltStatCd") =="120"){
                if(!gfnGetLogicAuth("OR_DLVR_FN")){
                    gfnMessage("현재 로그인 사용자는 배송완료 권한이  없습니다.");
                    fnReset();
                    return false;
                }
            }
            if (dsOrderDtl.getColumn(i, "choiceGub") ==1 && pVal == -1 ) {
                    alert("변경할 수 없는 데이타 입니다.");
                    fnReset();
                    return false;
            }
            if(dsOrderDtl.getColumn(i, "choiceGub") ==1 && dsOrderDtl.getColumn(i, "excptDlvrcompCnt") > 0 ){
                if(!gfnGetLogicAuth("DLVR_CMPLT_ADMIN")){
                    alert("현재 로그인 사용자는 해당 상품의 배송완료 권한이  없습니다.");
                    fnReset();
                    return false;
                }
            }
            if(dsOrderDtl.getColumn(i, "choiceGub") ==1 && dsOrderDtl.getColumn(i, "orderLockCd") <> "00"){
                alert("변경할 수 없는 데이타 입니다. (LOCK : " + dsOrderDtl.getColumn(i, "orderLockNm") + ")");
                fnReset();
                return false;
            }
        }

        dsOrderDtl.enableevent = false;

        //일반 사은품 단독 처리
         if( dsOrderDtl.getCaseCount("choiceGub == '1'") == 1  && dsOrderDtl.getColumn(cRow, "choiceGub") == 1 && dsOrderDtl.getColumn(cRow, "giftYn") == "Y"){
             dsOrderDtl.setColumn(cRow, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
            dsOrderDtl.setColumn(cRow, "finalRvisPic", gvUserId);
        }else{
            
            //같은 OrderNum으로 필터
            dsOrderDtl.filter("orderNum=='" + dsOrderDtl.getColumn(choiceIndx, "orderNum") + "'");

            //정기배송
            if(beforePriodDlvrGoodsYn== "Y"){
                for(var i= 0; i<dsOrderDtl.rowcount; i++){
                    if(dsOrderDtl.getColumn(i, "orderNum") <> orderNum ){
                        break;
                    }
                    dsOrderDtl.setColumn(i, "choiceGub", 1);
                    dsOrderDtl.setColumn(i, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
                    dsOrderDtl.setColumn(i, "finalRvisPic", gvUserId);
                }
            }else{
                for(var i = 0; i<dsOrderDtl.rowcount; i++){
                    if(dsOrderDtl.getColumn(i, "orderNum") <> orderNum ){
                        break;
                    }
                    if(dsOrderDtl.getColumn(i, "choiceGub")== '1' &&  dsOrderDtl.getColumn(i, "parntOrderSeq") == null && dsOrderDtl.getColumn(i, "giftYn") <> "Y" && ( dsOrderDtl.getColumn(i, "goodsTypeCd") == "CHC"  || dsOrderDtl.getColumn(i, "goodsTypeCd") == "PRT" )){
                        chcOrPrtOrderSeq = dsOrderDtl.getColumn(i, "orderSeq"); //CHC, PRT 상품의 OderSeq
                    }
                    //CHL, PRL 같이 처리
                    if(!gfnIsNull(chcOrPrtOrderSeq) && chcOrPrtOrderSeq == dsOrderDtl.getColumn(i, "parntOrderSeq") ){
                        dsOrderDtl.setColumn(i, "choiceGub", 1);
                        dsOrderDtl.setColumn(i, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
                        dsOrderDtl.setColumn(i, "finalRvisPic", gvUserId);
                    }else{
                        //일반상품 일괄처리 및 사후사은품 일괄처리 ※ 사후사은품 row position 이동 시, gift_yn 값이 'Y' 에서 'N'으로 setting되고 있음
                        if((dsOrderDtl.getColumn(i, "choiceGub") ==1  && dsOrderDtl.getColumn(i, "parntOrderSeq") == null)){
                            dsOrderDtl.setColumn(i, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
                            dsOrderDtl.setColumn(i, "finalRvisPic", gvUserId);
                        }
                        else{ //일반사은품인 경우는 체크해제 처리
                              dsOrderDtl.setColumn(i, "choiceGub", 0);
                         }
                    }
                }
            }
            //filter제거
            dsOrderDtl.filter("");
        }

            dsOrderDtl.enableevent = true;

        if ( !confirm("배송완료 처리 하시겠습니까?") ) {
            fnReset();
            return false;
        }

        //동일 OrderNum 아닌경우 체크해제처리
        dsOrderDtl.enableevent = false;
        dsOrderDtl.filter("choiceGub == '1' && orderNum <> '" + orderNum + "'");
        if(dsOrderDtl.rowcount>0){
            for (var i=0; i < dsOrderDtl.rowcount; i++) {
                dsOrderDtl.setColumn(i, "choiceGub", 0);
                dsOrderDtl.setColumn(i, "crud", "R");
            }
        }
        dsOrderDtl.filter("");
        dsOrderDtl.enableevent = true;

        fnSaveOrderDtlReltStatCd150(); //  관련(주문) 상태 코드 배송완료 처리
    
        break;
    }


    function fnSaveOrderDtlReltStatCd150() {

        if(!fnBeforeSaveOrderDtlReltStatCd150()) return;
    
        // 2015-12-21 LMG 조회시작 시 행제한조건 추가 시작!!!
        dsInqryOrderDtl.setColumn(0, "searchSeq"  , ++gSearchSeq);	// 현재조회SEQ
        dsInqryOrderDtl.setColumn(0, "startRowNum", 1);	// 시작행
        dsInqryOrderDtl.setColumn(0, "endRowNum"  , gSearchLimit);   	// 종료행
        // 2015-12-21 LMG 조회시작 시 행제한조건 추가 완료!!!
    
        //var strArgs  = "";
        var strArgs  = "";
        var strInds  = "dsInqryOrderDtl=dsInqryOrderDtl dsOrderDtl=dsOrderDtl:U";
        var strOutds = "dsOrderDtl=dsOrderDtl";
    
        //this.setWaitCursor(true, true);
        //gfnSend("save", "server_url::backend/or/SVOR0102010/doSaveOrderDtlReltStatCd150.do", strInds, strOutds, strArgs, "SAVE", true);
        gfnSend("save", "server_url::backend/or/SVOR0102010/doSaveOrderDtlReltStatCd150.do", strInds, strOutds, strArgs, "SAVE", false);
    
    }