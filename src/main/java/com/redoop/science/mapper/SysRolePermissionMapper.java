package com.redoop.science.mapper;

import com.redoop.science.entity.SysRolePermission;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-11-05
 */
public interface SysRolePermissionMapper extends BaseMapper<SysRolePermission> {

    @Select("select PERMISSION_ID from sys_role_permission where ROLE_ID = #{id}")
    List<Long> findById(Long id);


    int deleteBatch(Long[] roleIds);
}
