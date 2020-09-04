
package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.redoop.science.entity.SysUser;
import com.redoop.science.mapper.SysUserMapper;
import com.redoop.science.service.ISysUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotEmpty;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements ISysUserService {


    @Autowired
    SysUserMapper sysUserMapper;

    /*@Override
    public SysUser select(SysUser user) {
        return sysUserMapper.select(user);
    }*/


    @Override
    public SysUser select(@NotEmpty(message = "用户名不能为空") String username, @NotEmpty(message = "密码不能为空") String password) {
        return sysUserMapper.select(username,password);
    }

    /**
     * 根据nikeName查ID
     * @param userNickName
     * @return
     */
    @Override
    public String findById(String userNickName) {
        return sysUserMapper.findById(userNickName);
    }
}