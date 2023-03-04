
package com.redoop.science;

import com.alibaba.fastjson.JSON;
import com.redoop.science.constant.DBEnum;
import com.redoop.science.entity.RealDb;
import com.redoop.science.entity.VirtualTables;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

import java.time.LocalDateTime;
import java.util.Date;

@RunWith(SpringRunner.class)
@SpringBootTest
public class DataScienceApplicationTests {

     MockMvc mockMvc;
    @Autowired
    private WebApplicationContext applicationContext;
    @Before
    public void init(){
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext).build();
    }
    @Test
    public void contextLoads() {
    }
    @Test
    public void realDbSave(){
        String content = "";
        try {
            RealDb realDb = new RealDb();
            ///realDb.setCreateDate(LocalDateTime.now());
            realDb.setName("ORACLE2");
            realDb.setCreatorId(1);
            realDb.setCreatorName("www");
            realDb.setDbType(DBEnum.ORACLE.getDbType());
            realDb.setIp("192.168.10.111");
            realDb.setNikeName("ORACLE2");
            realDb.setPort(456);
            realDb.setRemark("dfdwwwerwe");
            content = JSON.toJSONString(realDb);
            mockMvc.perform(MockMvcRequestBuilders.post("/real/save").content(content).contentType(MediaType.APPLICATION_JSON_UTF8));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void vDbSave(){
        String content = "";
        try {
            VirtualTables realDb = new VirtualTables();
            realDb.setCreateDate(LocalDateTime.now());
            realDb.setName("aaa");
            realDb.setCreatorId(1);
            realDb.setCreatorName("www");
            realDb.setRemark("dfdwwwerwe");
            content = JSON.toJSONString(realDb);
            mockMvc.perform(MockMvcRequestBuilders.post("/virtual/save").content(content).contentType(MediaType.APPLICATION_JSON_UTF8));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}