create or replace PROCEDURE get_topsql(sample_time IN varchar2 default null, dbid number default null, inst_id number default null) IS
  temp clob;
  OUTH CLOB;
  L_SAMPLE_TIME DATE;
  L_SAMPLE_END_TIME DATE;
  l_correct_date varchar2(1000);
  l_ctime varchar2(100);
  l_total number;
BEGIN
  outh := empty_clob();
  TEMP := EMPTY_CLOB();

  IF (SAMPLE_TIME is null) THEN
    L_SAMPLE_TIME := SYSDATE - 25/60/24;
    L_SAMPLE_END_TIME := sysdate - 15/3600/24;
  ELSE
    L_CORRECT_DATE := SUBSTR(SAMPLE_TIME,0,INSTR(SAMPLE_TIME,'T',1)-1) || ' ' || SUBSTR(SAMPLE_TIME,INSTR(SAMPLE_TIME,'T',1)+1,INSTR(SAMPLE_TIME,'-',-1,1)-INSTR(SAMPLE_TIME,'T',1)-1) ;
    begin
      L_SAMPLE_TIME := TO_DATE(L_CORRECT_DATE,'YYYY-MM-DD hh24:mi:ss');
      L_SAMPLE_END_TIME := L_SAMPLE_TIME + 15/3600/24;
    EXCEPTION WHEN OTHERS THEN
      L_SAMPLE_TIME := SYSDATE - 25/60/24;
    end;
  END IF;
  
  if ((DBID is not null) and (inst_id is not null)) then
      insert into sash_target_dynamic values ( dbid, inst_id , 1);
  end if;
  

  DBMS_LOB.CREATETEMPORARY(OUTH, TRUE);
  DBMS_LOB.APPEND(OUTH , TO_CLOB('{"topsql":['));
  FOR CUR IN ( select '{"SQL_ID":"' || sql_id || '","TOT":' || TO_CHAR(tot,'9990.99') || ',"CPU":' || TO_CHAR(CPU,'9990.99') ||
              ',"SCHEDULER":' || TO_CHAR(SCHEDULER,'9990.99') || ',"USERIO":' || TO_CHAR("USER I/O",'9990.99') || ',"SYSTEMIO":' || TO_CHAR("SYSTEM I/O",'9990.99') || ',"CONCURRENCY":' || TO_CHAR(CONCURRENCY,'9990.99') ||
              ',"APPLICATION":' || TO_CHAR(APPLICATION,'9990.99') || ',"COMMIT":' || TO_CHAR(COMMIT,'9990.99') || ',"CONFIGURATION":' || TO_CHAR(CONFIGURATION,'9990.99') || ',"ADMINISTRATIVE":' || TO_CHAR(ADMINISTRATIVE,'9990.99') ||
              ',"NETWORK":' || to_char(NETWORK,'9990.99') || ',"QUEUEING":' || to_char(QUEUEING,'9990.99') || ',"CLUSTER":' || to_char("CLUSTER",'9990.99') || ',"OTHER":' || to_char(OTHER,'9990.99') ||
              '},' line, totalsum1
  from (
select sql_id, totalsum1, round(w*100,2) tot,  
nvl("'ON CPU'",0) "CPU",
nvl("'Scheduler'",0) Scheduler ,
nvl("'User I/O'",0) "USER I/O" ,
nvl("'System I/O'",0) "SYSTEM I/O" ,
nvl("'Concurrency'",0) Concurrency ,
nvl("'Application'",0) Application ,
nvl("'Commit'",0) Commit,
nvl("'Configuration'",0) Configuration,
nvl("'Administrative'",0) Administrative ,
nvl("'Network'",0) Network ,
nvl("'Queueing'",0) Queueing ,
nvl("'Cluster'",0) "CLUSTER",
nvl("'Other'",0) Other
from (
 select sql_id,
 decode(session_state,'WAITING',wait_class,'ON CPU') wait_class,
 sum(count(*)) over (partition by sql_id) / sum(count(*)) over () w,
 sum(count(*)) over () totalsum1,
 --min(sample_time) st,
 count(*) cnt,
 sum(count(*)) over () totalsum
 from v$active_session_history
 where sample_time > sysdate - 5/60/24 and sql_id is not null
 group by sql_id,
          decode(session_state,'WAITING',wait_class,'ON CPU')
 order by sql_id
)
pivot (
   sum(round(cnt/totalsum*100,2))
   for (wait_class) in
   ('Administrative','Application','Cluster','Commit','Concurrency',
    'Configuration','Network','Other','Queueing','Scheduler','System I/O',
    'User I/O','ON CPU'
   )
) order by tot desc
) where rownum < 11
 ) loop
   l_total := cur.totalsum1;
	 temp := cur.line;
	 dbms_lob.append(outh , temp);
  END LOOP;
  --select to_char(sysdate,'YYYY-MM-DD') || 'T' || to_char(to_date((trunc(to_char(sysdate, 'SSSSS')/15)+1)*15,'SSSSS'),'HH24:MI:SS') || '-00:00' into l_ctime from dual;
  select to_char(sysdate,'YYYY-MM-DD') || 'T' || to_char(to_date((trunc(to_char(sysdate, 'SSSSS')/15))*15,'SSSSS'),'HH24:MI:SS') || '-00:00' into l_ctime from dual;
  dbms_lob.append(outh , TO_CLOB('{}], "oldest_time" : "' || l_ctime || '" , "total": "' || l_total || '" }'));
  HTP.print(outh);
END get_topsql;