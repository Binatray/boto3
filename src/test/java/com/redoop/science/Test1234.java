package com.redoop.science;

import com.redoop.science.entity.RealDb;
import org.junit.Test;
import org.omg.CORBA.PUBLIC_MEMBER;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

/**
 * @Author: Alan
 * @Time: 2018/9/29 10:37
 * @Description:
 */
public class Test1234 {
    /*@Test
    public void test(){
        String copySql = "select * from 'ods.people' as a;";
        StringBuffer returnSql = new StringBuffer();

        String[] codes = copySql.split(" ");

        Set<String> tableNames = new HashSet<>();
        Map<String, String> viwesNames = new HashMap<>();
        for (String table : codes) {
            if (table.indexOf("hive_") != -1) {

                String dbNames = table.split("'")[1];
                String dbName = dbNames.split("\\.")[0];
                String tableName = dbNames.split("\\.")[1];

                System.out.println("dbNames======="+dbNames);
                System.out.println("dbName======="+dbName);
                System.out.println("tableName======="+tableName);


                viwesNames.put(table, tableName);
                tableNames.add(tableName);
                System.out.println("tableNames======="+tableNames);
            }
        }
    }*/
    @Test
    public void test() {
        String copySql = "select * from `test.t_user` as test_user;";
        StringBuilder returnSql = new StringBuilder();
        //获取使用库
        String[] tables = copySql.split("`");

        // String[] partition = copySql.split("_partition");

        Set<String> tableNames = new HashSet<>();
        Set<String> dbNames = new HashSet<>();
        Set<String> partition = new HashSet<>();

        for (String table : tables) {
            if (table.indexOf(".") != -1) {
                String[] tableInfo = table.split("\\.");
                String dbName = tableInfo[0];

                tableNames.add(table);
                dbNames.add(dbName);

                System.out.println("dbName=======" + dbName);
                System.out.println("dbNames=======" + dbNames);
            }

          /* if (table.indexOf("_partition")!=-1){
               String[] tableInfo = table.split("\\.");
               String parName = tableInfo[0];

               tableNames.add(table);
               partition.add(parName);

               System.out.println("parName======="+parName);
               System.out.println("partition======="+partition);
           }*/
        }
        for (String tableName : tableNames) {
            String[] dbName = tableName.split("\\.");
            System.out.println(dbName[1]);
        }
    }


    @Test
    public void a() {
        int[] arr={12,45,34,85,48,3,0,2,1};
        //外层循环控制排序趟数
        for (int i = 0; i<arr.length; i++){
            //内层循环控制每一趟排序多少次
            for (int j = arr.length-1; j>i; j--){
                if (arr[j]>arr[j-1]){
                    int tmp;
                    tmp = arr[j];
                    arr[j] = arr[j-1];
                    arr[j-1] = tmp;
                }
            }
        }
        for (int num :arr){
            System.out.println(num);
        }
    }


 @Test
    public  void  b(){
      int[] arry={78,65,45,21,35,68,98,99};

      for(int i =0; i<arry.length;i++){
          for (int j=0;j<arry.length-1-i;j++){
              if (arry[j]>arry[j+1]){
                  int tmp;
                  tmp= arry[j];
                  arry[j]=arry[j+1];
                  arry[j+1]=tmp;
              }
          }
      }

     for (int num :arry){
         System.out.println(num);
     }


 }


}