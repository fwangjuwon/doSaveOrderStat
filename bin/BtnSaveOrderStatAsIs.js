switch (obj.name) {
    case "btnOrderHstDlvrStatRvis" :
    // 배송 상태 변경 (150	배송완료처리)
    // 관련 상태 코드 reltStatCd
    // 100	주문접수
    // 110	결제완료
    // 120	출고지시
    // 130	출고확정
    // 140	출고완료
    // 150	배송완료
    // 200	주문후취소
    // 210	입금후취소
    // 220	출고지시후취소
    // 230	출고확정후취소
    // 240	전산자동취소
    // 300	반품접수
    // 310	수거지시
    // 320	수거지시서발행
    // 330	수거지시후취소
    // 340	반품입고확정
    // 350	반품취소
        //이슈번호 0006854: 배송완료처리 오류 2014-12-09 16:20
        /* 한개의 주문번호에 본품과 사은품이 연결되어있을경우 배송완료처리시 2개의 상품이 모두 배송완료처리됨 배송완료처리시 본품과사은품 각각 배송완료처리 할수 있도록 수정 필요함 */
        /* 파샬 상품은 부모단위로 처리*/
        //var wStr = "CHL;PCL;PRL;" //초이스child, 팩child, 파샬child
        //if ( wStr.indexOf(dsOrderDtl.getColumn(cRow, "goodsTypeCd")) > -1 || wStr.indexOf(dsOrderDtl.getColumn(cRow, "partialTypeCd")) > -1) {

        if ( dsOrderDtl.getColumn(cRow, "goodsTypeCd").substr(2, 1) == "L" || dsOrderDtl.getColumn(cRow, "partialTypeCd") == "PRL" ){//|| dsOrderDtl.getColumn(cRow, "giftYn") == "Y" ) {
            return false;
        }

        var pStatCd = "100;110;120;130;140;;";
        var pVal = pStatCd.indexOf(dsOrderDtl.getColumn(cRow, "reltStatCd"));

        if ( pVal == -1 ) {
            alert("변경할 수 없는 데이타 입니다.");
            return false;
        }

        if ( dsOrderDtl.getColumn(cRow, "orderLockCd") <> "00" ) {
            alert("변경할 수 없는 데이타 입니다. (LOCK : " + dsOrderDtl.getColumn(cRow, "orderLockNm") + ")");
            return false;

        }

        if ( dsOrderDtl.getColumn(cRow, "reltStatCd") == "120" ){//출고지시 권한체크
            if(!gfnGetLogicAuth("OR_DLVR_FN")){
                gfnMessage("현재 로그인 사용자는 배송완료 권한이  없습니다.");
                return false;
            }
        }

        //배송완료 제한 협력업체여부체크(월정산마감 이슈발생)   2023.06.20 sunyimhuh
        if(dsOrderDtl.getColumn(cRow, "excptDlvrcompCnt") > 0){
            if(!gfnGetLogicAuth("DLVR_CMPLT_ADMIN")){
                gfnMessage("현재 로그인 사용자는 해당 상품의 배송완료 권한이  없습니다.");
                return false;
            }
        }

        if ( !confirm("배송완료 처리 하시겠습니까?") ) { return false; }
            divBody.divOrderHst.txtSelectRow.value = cRow;  // 현재 Row 저장

            dsOrderDtl.enableevent = false;

            dsOrderDtl.reset();
            dsOrderDtl.setColumn(cRow, "choiceGub", "1");
            dsOrderDtl.setColumn(cRow, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
            dsOrderDtl.setColumn(cRow, "finalRvisPic", gvUserId);

            if ( dsOrderDtl.getColumn(cRow, "priodDlvrGoodsYn") == "Y" ) { // 정기 배송 상품 여부 = Y
                // 정기 배송 상품 Check 처리
                for (var i=0; i <= dsOrderDtl.rowcount-1; i++) {
                    if ( dsOrderDtl.getColumn(cRow, "orderNum") == dsOrderDtl.getColumn(i, "orderNum") ) {

                        dsOrderDtl.setColumn(i, "choiceGub", 1);
                        dsOrderDtl.setColumn(i, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
                        dsOrderDtl.setColumn(i, "finalRvisPic", gvUserId);
                    } else {
                        if ( cRow > i ) {
                            break;
                        }
                    }
                }

            } else {
                // Chile 상품 Check 처리
                for (var i=cRow+1; i <= dsOrderDtl.rowcount-1; i++) {
                    if ( ( dsOrderDtl.getColumn(cRow, "orderSeq") == dsOrderDtl.getColumn(i, "parntOrderSeq") && dsOrderDtl.getColumn(i, "giftYn") <> "Y" )
                            || ( dsOrderDtl.getColumn(i, "partialTypeCd") == "PRL" && dsOrderDtl.getColumn(cRow, "orderSeq") == dsOrderDtl.getColumn(i, "giftParntOrderSeq") ) ) {

                        dsOrderDtl.setColumn(i, "choiceGub", 1);
                        dsOrderDtl.setColumn(i, "reltStatCd", "150");  // 150 배송완료 , 100 주문접수
                        dsOrderDtl.setColumn(i, "finalRvisPic", gvUserId);
                    } else {
                        break;
                    }
                }
            }

            dsOrderDtl.enableevent = true;

            fnSaveOrderDtlReltStatCd150(); // 관련(주문) 상태 코드 배송완료 처리
            break;