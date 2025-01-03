# 특정 조건(예: choiceGub = 1)을 기준으로 데이터 일괄 처리

## 1. 요구사항
프로젝트에서는 choiceGub 값이 1인 데이터를 (체크한 값을 choiceGub = 1 로 세팅) 일괄적으로 처리 (일괄 배송완료 처리)
다수의 데이터를 동시에 변경하거나 검증해야 하는 상황에서 발생하는 주요 시나리오

---

## 2. 기존 방식의 문제점 (AS-IS 코드)
- 복잡한 조건문: 다양한 케이스를 처리하기 위해 중첩된 조건문과 반복문 사용.
- 효율성 부족: 이벤트 활성화/비활성화를 반복하며 성능 저하.
- 가독성 문제: 코드의 흐름이 복잡해 유지보수가 어려움.

**AS-IS**
```javascript
for (var i = choiceIndx; i < dsOrderDtl.rowcount; i++) {
    if (dsOrderDtl.getColumn(i, "choiceGub") == 1) {
        dsOrderDtl.setColumn(i, "reltStatCd", "150");
    }
}
```

---

## 3. 개선된 로직 (TO-BE 코드)
- 로직 단순화: 데이터를 필터링하여 choiceGub = 1 조건을 먼저 확인하고 처리.
- 성능 개선: 불필요한 이벤트 설정 제거 및 조건 검증을 외부로 분리.
- 가독성 향상: 중복 코드를 제거하고 처리 순서를 명확히 함.

**TO-BE**
```javascript
dsOrderDtl.filter("choiceGub == '1'");
for (var i = 0; i < dsOrderDtl.rowcount; i++) {
    dsOrderDtl.setColumn(i, "reltStatCd", "150");
}
dsOrderDtl.filter(""); // 필터 초기화
```

---

## 4. 개선의 가치
- 효율성: 데이터 필터링을 통해 대상 데이터를 한정하고, 반복문에서의 부하를 줄임.
- 가독성: 중복 제거와 단순화된 조건 처리로 유지보수성을 높임.
- 확장성: 새로운 조건이나 비즈니스 로직 추가 시, 기존 코드를 변경하지 않고도 확장 가능.

---

# 추가 개선된 포인트와 코드 비교

## 1. 코드 간소화 및 가독성 향상
**AS-IS**
```javascript
if(dsOrderDtl.getCaseCount("choiceGub == '1'") == 0){
    dsOrderDtl.enableevent = false;
    dsOrderDtl.setColumn(cRow, "choiceGub", "1");
    dsOrderDtl.enableevent = true;
}
```

**TO-BE**
```javascript
if (dsOrderDtl.getCaseCount("choiceGub == '1'") == 0) {
    dsOrderDtl.reset();
    dsOrderDtl.setColumn(cRow, "choiceGub", "1");
}
```

**개선 포인트**: 이벤트를 반복적으로 활성화/비활성화하는 복잡한 코드 대신, `reset()`을 사용하여 단순화.

---

## 2. 로직 최적화
**AS-IS**
```javascript
var pStatCd = "100;110;120;130;140;;";
var pVal = pStatCd.indexOf(dsOrderDtl.getColumn(choiceIndx, "reltStatCd"));
// 여러 번 반복되는 루프에서 검증
for(var i = choiceIndx; i < dsOrderDtl.rowcount; i++){
    if (dsOrderDtl.getColumn(i, "choiceGub") == 1 && pVal == -1) {
        alert("변경할 수 없는 데이터입니다.");
        return false;
    }
}
```

**TO-BE**
```javascript
var pStatCd = "100;110;120;130;140;;";
var pVal = pStatCd.indexOf(dsOrderDtl.getColumn(cRow, "reltStatCd"));
if (pVal == -1) {
    alert("변경할 수 없는 데이터입니다.");
    return false;
}
```

**개선 포인트**: `pStatCd` 검증 로직을 루프 외부로 이동하여 불필요한 반복 제거.

---

## 3. 중복 코드 제거
**AS-IS**
```javascript
for(var i = 0; i < dsOrderDtl.rowcount; i++) {
    if (dsOrderDtl.getColumn(i, "choiceGub") == 1) {
        dsOrderDtl.setColumn(i, "reltStatCd", "150");
    }
}
```

**TO-BE**
```javascript
dsOrderDtl.filter("choiceGub == '1'");
for (var i = 0; i < dsOrderDtl.rowcount; i++) {
    dsOrderDtl.setColumn(i, "reltStatCd", "150");
}
dsOrderDtl.filter(""); // 필터 초기화
```

**개선 포인트**: 데이터 필터링을 적용해 선택된 데이터만 처리, 루프의 범위를 줄임.

---

## 4. 에러 처리 및 권한 검증 강화
**AS-IS**
```javascript
if(dsOrderDtl.getColumn(i, "reltStatCd") == "120") {
    if(!gfnGetLogicAuth("OR_DLVR_FN")) {
        alert("권한이 없습니다.");
        return false;
    }
}
```

**TO-BE**
```javascript
if (dsOrderDtl.getColumn(cRow, "reltStatCd") == "120" && !gfnGetLogicAuth("OR_DLVR_FN")) {
    gfnMessage("현재 로그인 사용자는 배송완료 권한이 없습니다.");
    return false;
}
```

**개선 포인트**: 조건 검증을 단순화하고 메시지 전달 방식을 통일하여 유지보수 용이.

---

## 5. 이벤트 설정 간소화
**AS-IS**
```javascript
dsOrderDtl.enableevent = false;
dsOrderDtl.filter("choiceGub == '1'");
dsOrderDtl.enableevent = true;
```

**TO-BE**
```javascript
dsOrderDtl.filter("choiceGub == '1'");
```

**개선 포인트**: `enableevent` 불필요한 설정 제거로 코드 단순화.

---

## 기대 효과
- **유지보수 시간 단축**: 간결한 코드로 인해 디버깅 및 확장 작업이 용이.
- **성능 향상**: 중복 로직 제거 및 초기 데이터 검증 강화로 실행 속도 증가.
- **코드 가독성 향상**: 구조화된 로직으로 팀원 간 협업 효율 증가.

