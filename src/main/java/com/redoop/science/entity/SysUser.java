
package com.redoop.science.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

import lombok.*;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotEmpty;

/**
 * <p>
 * 
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class SysUser implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 编号
     */
    @TableId(value = "ID", type = IdType.AUTO)
    private Integer id;

    /**
     * 昵称
     */
    @TableField("NICK_NAME")
    private String nickName;

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
    //private LocalDateTime createDate;

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
    private LocalDateTime operationTime;

    /**
     * 邮箱
     */
    @TableField("EMAIL")
    private String email;

    /**
     * 用户名
     */
    @NotEmpty(message="用户名不能为空")
    @TableField("USERNAME")
    private String username;

    /**
     * 密码
     */
    @NotEmpty(message="密码不能为空")
    @TableField("PASSWORD")
    private String password;

    /**
     * 用户状态 0-正常启用 1-停用 2-删除
     */
    @TableField("STATUS")
    private Integer status;


    //_____________后加______________________

    /**
     * 部门ID
     */
    @NotEmpty(message="部门不能为空")
    @TableField("DEPT_ID")
    private Long deptId;

    /**
     * 部门名称
     */
    @TableField(exist=false)
    private String deptName;

    /**
     * 角色ID列表
     */
    @TableField(exist=false)
    private List<Long> roleIdList;





    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Integer getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Integer creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Long getDeptId() {
        return deptId;
    }

    public void setDeptId(Long deptId) {
        this.deptId = deptId;
    }

    public String getDeptName() {
        return deptName;
    }

    public void setDeptName(String deptName) {
        this.deptName = deptName;
    }

    public List<Long> getRoleIdList() {
        return roleIdList;
    }

    public void setRoleIdList(List<Long> roleIdList) {
        this.roleIdList = roleIdList;
    }

    public Integer getOperationId() {
        return operationId;
    }

    public void setOperationId(Integer operationId) {
        this.operationId = operationId;
    }

    public LocalDateTime getOperationTime() {
        return operationTime;
    }

    public void setOperationTime(LocalDateTime operationTime) {
        this.operationTime = operationTime;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}