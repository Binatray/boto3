package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import javax.validation.constraints.Max;
import javax.validation.constraints.NotEmpty;

/**
 * <p>
 * 注册函数
 * </p>
 *
 * @author Alan
 * @since 2018-10-16
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class RegFunction implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 编号
     */
    @TableId("ID")
    private Integer id;

    /**
     * 名称
     */
    @TableField("NAME")
    @NotEmpty
    @Max(value = 50,message = "函数名不得超过50个字符")
    private String name;

    /**
     * 函数
     */
    @TableField("CODE")
    @NotEmpty
    private String code;

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
    private LocalD