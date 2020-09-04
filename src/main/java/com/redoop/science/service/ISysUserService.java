
package com.redoop.science.service;

import com.redoop.science.entity.SysUser;
import com.baomidou.mybatisplus.extension.service.IService;

import javax.validation.constraints.NotEmpty;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
public interface ISysUserService extends IService<SysUser> {

    //SysUser select(SysUser user);

    SysUser select(@NotEmpty(message = "用户名不能为空") String username, @NotEmpty(message = "密码不能为空") String password);

    String findById(String userNickName);
}