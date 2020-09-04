
package com.redoop.science.utils;

import com.redoop.science.dto.SysUserDto;
import com.redoop.science.entity.SysUserDetails;

/**
 * @Author: Alan
 * @Time: 2018/10/30 10:28
 * @Description:
 */
public class UserToDetail {

    public static SysUserDetails toDetail(SysUserDto sysUser){
        SysUserDetails sysUserDetails = new SysUserDetails();
        sysUserDetails.setId(sysUser.getId());
        sysUserDetails.setNickname(sysUser.getNickName());
        sysUserDetails.setUsername(sysUser.getUsername());
        sysUserDetails.setPassword(sysUser.getPassword());
        sysUserDetails.setRoles(sysUser.getRoles());
        sysUserDetails.setStatus(sysUser.getStatus());
        return sysUserDetails;
    }
}