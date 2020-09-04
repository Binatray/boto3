package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 *
 * admin
 * 2018年11月21日10:28:40
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class SysRoleAnalysis implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "ID", type = IdType.AUTO)
    private Integer id;

    /**
     * 角色表ID
     */
    @TableField("ROLE_ID")
    private Integer roleId;

    /**
     * 分析ID
     */
    @TableField("ANALYSIS_ID")
    private Integer analysisId;


}
