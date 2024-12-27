# AS-IS
```
	var cRow = dsOrderDtl.rowposition; //현재 position 되어있는 row의 데이터를 저장함

    switch (obj.name) {
    case "btnOrderHstDlvrStatRvis" :

        if ( dsOrderDtl.getColumn(cRow, "goodsTypeCd").substr(2, 1) == "L" || dsOrderDtl.getColumn(cRow, "partialTypeCd") == "PRL" ){//|| dsOrderDtl.getColumn(cRow, "giftYn") == "Y" ) {
                    return false;
        }

    }

```

# TO-BE
```

```