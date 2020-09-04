
package com.redoop.science.mapper;

import com.redoop.science.dto.SysUserDto;
import com.redoop.science.entity.SysUser;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.catalina.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {




    @Select("select * from sys_user where USERNAME = #{username} and PASSWORD = #{password}")
    SysUser select(@NotEmpty(message = "用户名不能为空")@Param("username") String username, @NotEmpty(message = "密码不能为空")@Param("password") String password);

    /**
     * 根据用户名查询用户及其权限集
     * @param username
     * @return
     */
    SysUserDto findByUsername(@Param("username")String username);

    @Select("select ID from sys_user where USERNAME = #{userNickName}")
    String findById(String userNickName);
}