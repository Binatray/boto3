
package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.springframework.security.core.GrantedAuthority;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;

/**
 * @Author: Alan
 * @Time: 2018/10/26 15:42
 * @Description: 系统角色
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class SysRole implements GrantedAuthority {

    private static final long serialVersionUID = 1L;
    /**
     * 编号
     */
    @TableId(value = "ID", type = IdType.AUTO)
    private Integer id;

    /**
     * 角色名
     */
    @NotEmpty(message="角色名不能为空")
    @TableField("NAME")
    private String name;

    @Override
    public String getAuthority() {
        return name;
    }



    //_______________后加_____________________________
    /**
     * 注释REMARK
     */
    @TableField("REMARK")
    private String remark;

    /**
     * 部门ID
     */
    @NotNull(message="部门不能为空")
    @TableField("DEPT_ID")
    private Integer deptId;

    /**
     * 部门名称
     */
    @TableField(exist=false)
    private String deptName;

    /**
     * 资源(菜单)List(查询角色对应的部门)
     */
    @TableField(exist=false)
    private List<Long> permissionIdList;

    /**
     * 部门List(查询角色对应的部门)
     */
    @TableField(exist=false)
    private List<Long> deptIdList;


    /**
     * 创建时间
     */
    @TableField("CREATE_DATE")
    private Date createTime;

    /**
     * 真实库List(查询角色对应的真实库)
     */
    @TableField(exist=false)
    private List<Long> readDbIdList;

    /**
     * 视图库List(查询角色对应的视图表)
     */
    @TableField(exist=false)
    private List<Long> viewIdList;

    /**
     * 函数哭List(查询角色对应的函数)
     */
    @TableField(exist=false)
    private List<Long> funIdList;


    /**
     * 虚拟库List(查询角色对应的虚拟库)
     */
    @TableField(exist=false)
    private List<Long> virtualIdList;

    /**
     * 分析List(查询角色对应的分析)
     */
    @TableField(exist=false)
    private List<Long> analysisIdList;


}