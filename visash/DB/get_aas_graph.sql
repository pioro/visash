create or replace PROCEDURE get_aas_graph(sample_time IN varchar2 default null, dbid number default null, inst_id number default null) IS
  temp clob;
  OUTH CLOB;
  L_SAMPLE_TIME DATE;
  L_SAMPLE_END_TIME DATE;
  l_correct_date varchar2(1000);
  l_ctime varchar2(100);
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
  DBMS_LOB.APPEND(OUTH , TO_CLOB('{"ash":['));
  FOR CUR IN (select * from (
              SELECT '{"SAMPLE_TIME":"' || SAMPLE_TIME || '","AAS":' || TO_CHAR(AAS,'9990.99') || ',"CPU":' || TO_CHAR(CPU,'9990.99') ||
              ',"SCHEDULER":' || TO_CHAR(SCHEDULER,'9990.99') || ',"USERIO":' || TO_CHAR("USER I/O",'9990.99') || ',"SYSTEMIO":' || TO_CHAR("SYSTEM I/O",'9990.99') || ',"CONCURRENCY":' || TO_CHAR(CONCURRENCY,'9990.99') ||
              ',"APPLICATION":' || TO_CHAR(APPLICATION,'9990.99') || ',"COMMIT":' || TO_CHAR(COMMIT,'9990.99') || ',"CONFIGURATION":' || TO_CHAR(CONFIGURATION,'9990.99') || ',"ADMINISTRATIVE":' || TO_CHAR(ADMINISTRATIVE,'9990.99') ||
              ',"NETWORK":' || to_char(NETWORK,'9990.99') || ',"QUEUEING":' || to_char(QUEUEING,'9990.99') || ',"CLUSTER":' || to_char("CLUSTER",'9990.99') || ',"OTHER":' || to_char(OTHER,'9990.99') ||
              '},'
  as line
from (
select tday || 'T' || to_char(to_date(ts*15,'SSSSS'),'HH24:MI:SS') || '-00:00' sample_time, AAS,
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
 select trunc(to_char(sample_time, 'SSSSS')/15) ts,to_char(sample_time,'YYYY-MM-DD') tday,
 decode(session_state,'WAITING',wait_class,'ON CPU') wait_class,
 count(*) cnt,
 sum(count(*)) over (partition by trunc(to_char(sample_time, 'SSSSS')/15),to_char(sample_time,'YYYY-MM-DD')) sum,
 SUM(COUNT(*)) OVER (PARTITION BY TRUNC(TO_CHAR(SAMPLE_TIME, 'SSSSS')/15),TO_CHAR(SAMPLE_TIME,'YYYY-MM-DD'))/15 AAS
 FROM V$ACTIVE_SESSION_HISTORY A
 where a.sample_time >= L_SAMPLE_TIME and a.sample_time < L_SAMPLE_END_TIME
 group by trunc(to_char(sample_time, 'SSSSS')/15),to_char(sample_time,'YYYY-MM-DD'),
          decode(session_state,'WAITING',wait_class,'ON CPU')
 order by 1
)
PIVOT (
   sum(round(cnt/15,2))
   for (wait_class) in
   ('Administrative','Application','Cluster','Commit','Concurrency',
    'Configuration','Network','Other','Queueing','Scheduler','System I/O',
    'User I/O','ON CPU'
   )
) ORDER BY 1 DESC)
WHERE ROWNUM < 91)
order by 1 ) loop

	 temp := cur.line;
	 dbms_lob.append(outh , temp);
  END LOOP;
  --select to_char(sysdate,'YYYY-MM-DD') || 'T' || to_char(to_date((trunc(to_char(sysdate, 'SSSSS')/15)+1)*15,'SSSSS'),'HH24:MI:SS') || '-00:00' into l_ctime from dual;
  select to_char(sysdate,'YYYY-MM-DD') || 'T' || to_char(to_date((trunc(to_char(sysdate, 'SSSSS')/15))*15,'SSSSS'),'HH24:MI:SS') || '-00:00' into l_ctime from dual;
  dbms_lob.append(outh , TO_CLOB('{}], "current_time" : "' || l_ctime || '" }'));
  HTP.print(outh);
END get_aas_graph;