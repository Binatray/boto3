
package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 
 * </p>
 *
 * @author Alan
 * @since 2018-11-05
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class SysPermission implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "ID", type = IdType.AUTO)
    private Integer id;

    /**
     * 名称
     */
    @TableField("NAME")
    private String name;

    /**
     * 备注
     */
    @TableField("DESCRIPTION")
    private String description;

    /**
     * 链接
     */
    @TableField("URL")
    private String url;

    /**
     * 父节点
     */
    @TableField("PID")
    private String pid;


    //____________________后加____________________________
    /**
     * 父节点
     */
    @TableField("PARENT_ID")
    private Long parentId;


    /**
     * 授权(多个用逗号分隔，如：user:list,user:create)
     */
    @TableField("PERMS")
    private String perms;

    /**
     * 类型   0：目录   1：菜单   2：按钮
     */
    @TableField("TYPE")
    private Integer type;

    /**
     * 菜单图标
     */
    @TableField("ICON")
    private String icon;

    /**
     * 排序
     */
    @TableField("ORDER_NUM")
    private Integer orderNum;


    /**
     * 父菜单名称
     */
    @TableField(exist=false)
    private String parentName;
    /**
     * ztree属性
     */
    @TableField(exist=false)
    private Boolean open;

    @TableField(exist=false)
    private List<?> list;


}