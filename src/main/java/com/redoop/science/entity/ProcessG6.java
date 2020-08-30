package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

/**
 * 工作流
 * 2019年3月8日16:38:45
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@Setter
@Getter
public class ProcessG6 implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 编号
     */
    @TableField("ID")
    private Integer id;

    /**
     * 名称
     */
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
     * 编辑器中_保存之前内容
     */
    @TableField("CODE")
    private String code;

    /**
     * 编辑器_保存之后内容
     */
    @TableField("FINALLY_CODE")
    private String finallyCode;

}
