package com.redoop.science.dto;

import com.redoop.science.entity.SysRole;
import com.redoop.science.entity.SysUser;
import lombok.Data;

import java.util.List;

/**
 * @Author: Alan
 * @Time: 2018/10/30 10:32
 * @Description:
 */
@Data
public class SysUserDto extends SysUser {
    private List<SysRole> roles;

}
