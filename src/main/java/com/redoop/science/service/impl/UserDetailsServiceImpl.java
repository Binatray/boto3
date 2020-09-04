package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.redoop.science.dto.SysUserDto;
import com.redoop.science.entity.SysUser;
import com.redoop.science.mapper.SysUserMapper;
import com.redoop.science.utils.CustomException;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.UserToDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * @Author: Alan
 * @Time: 2018/10/29 9:50
 * @Description:
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    SysUserMapper sysUserMapper;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        QueryWrapper<SysUser> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("USERNAME",username);
        SysUserDto sysUser = sysUserMapper.findByUsername(username);
        if(sysUser==null){
            throw new CustomException(ResultEnum.NOT_USER.getCode(),ResultEnum.NOT_USER.getMsg());
        }
        return UserToDetail.toDetail(sysUser);
    }
}
