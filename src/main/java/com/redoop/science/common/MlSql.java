package com.redoop.science.common;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @Author: Alan
 * @Time: 2019/1/7 16:20
 * @Description:
 */
@Component
@ConfigurationProperties(prefix="seasbase.mlsql")
@Data
public class MlSql {
    private String ip;
    private Integer port;
}
