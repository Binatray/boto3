package com.redoop.science;

import org.junit.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashSet;
import java.util.Set;

/**
 * @Author: Alan
 * @Time: 2018/9/29 10:37
 * @Description:
 */
public class Test123 {
    @Test
    public void test(){
        //String sql = "select * from #.`db.test` as a;";
        String sql = "select bayes_predict(features) as predict_label, label  from data as result;";
        String[] codes = sql.split(" ");
        //String name ="bayes_predict";
        Set<String> tableNames = new HashSet<>();
        // Set<String> viwesNames = new HashSet<>();
        for (String table : codes) {
            if (table.indexOf(")") != -1) {
                //  %.`db1.test`

                // String dbNames = table.split("`")[1];
                String dbName = table.split("\\(")[0];
                // String tableName = dbName.split("\\)")[0];

                System.out.println("ddbName====="+dbName);
                //  System.out.println("ddbName====="+tableName);
//                tableNames.add(table);
            }
        }
    }
    @Test
    public void testBc(){
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        System.out.println(bCryptPasswordEncoder.encode("admin")+"----------"+bCryptPasswordEncoder.encode("admin").length());
    }
}