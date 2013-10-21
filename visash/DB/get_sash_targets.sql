create or replace PROCEDURE get_sash_targets IS
  temp clob;
  OUTH CLOB;
BEGIN
  outh := empty_clob();
  TEMP := EMPTY_CLOB();

  DBMS_LOB.CREATETEMPORARY(OUTH, TRUE);
  DBMS_LOB.APPEND(OUTH , TO_CLOB('{"sash_targets":['));
  FOR CUR IN ( select ' {"DBID":"' || dbid || '","INST_ID":"' || inst_num || '","DBNAME":"' || dbname || '","SID":"' || sid || '"},' as line from sash_targets ) loop
	 temp := cur.line;
	 dbms_lob.append(outh , temp);
  END LOOP;
  dbms_lob.append(outh , TO_CLOB('{}]}'));
  HTP.print(outh);
END get_sash_targets;