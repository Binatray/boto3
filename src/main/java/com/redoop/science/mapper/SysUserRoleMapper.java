package com.redoop.science.mapper;

import com.redoop.science.entity.SysRole;
import com.redoop.science.entity.SysUserRole;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * 用户权限对应表 Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-10-29
 */
public interface SysUserRoleMapper extends BaseMapper<SysUserRole> {

    @Select("select ROLE_ID from sys_user_role where USER_ID = #{id}")
    List<Long> findByRoleId(Long id);

    @Delete("delete from sys_user_role where USER_ID = #{user_id}")
    void deleteUserId(Integer user_id);

}
