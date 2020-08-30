
package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;

import lombok.*;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

/**
 * <p>
 * 实体数据源库
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@Setter
@Getter
public class RealDb implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 编号
     */
    @TableField("ID")
    private Integer id;

    /**
     * 库名
     */
    @NotEmpty(message="库名不能为空")
    @TableField("NAME")
    private String name;

    /**
     * 注释
     */
    @TableField("REMARK")
    private String remark;

    /**
     * 创建人编号
     */
    @TableField("CREATOR_ID")
    private Integer creatorId;

    /**
     * 创建人姓名
     */
    @TableField("CREATOR_NAME")
    private String creatorName;

    /**
     * 创建日期
     */
    @TableField("CREATE_DATE")
    private Date createDate;

    /**
     * 操作人编号
     */
    @TableField("OPERATION_ID")
    private Integer operationId;

    /**
     * 操作时间
     */
    @TableField("OPERATION_TIME")
    private Date operationTime;

    /**
     * 端口号
     */
    @NotNull(message="端口号不能空")
    @TableField("PORT")
    private Integer port;

    /**
     * ip地址
     */
    @NotEmpty(message="IP不能空")
    @TableField("IP")
    private String ip;

    /**
     * 数据库类型(1-mysql,2-oracle,3-pg,4-sql server,5-hive,6-redis,7-kafka,8-L-SQL)
     */

    @TableField("DB_TYPE")
    private Integer dbType;

    /**
     * 别名
     */
    @NotEmpty(message="数据源名不能空")
    @TableField("NIKE_NAME")
    private String nikeName;

    /**
     * 数据库用户
     */
    //@NotEmpty(message="数据库用户不能空")
    @TableField("DB_NAME")
    private String dbName;

    /**
     * 数据库用户密码
     */
    //@NotEmpty(message="数据库密码不能空")
    @TableField("DB_PASSWORD")
    private String dbPassword;

    @TableField("LOGO")
    private String logo;


}