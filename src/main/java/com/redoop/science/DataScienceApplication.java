package com.redoop.science;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * @author ALan
 */
@SpringBootApplication
@MapperScan("com.redoop.science.mapper")
@EnableRedisHttpSession(redisNamespace="redoop:session")
public class DataScienceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataScienceApplication.class, args);
    }

}