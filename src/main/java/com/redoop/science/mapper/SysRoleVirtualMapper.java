package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.redoop.science.entity.SysRoleVirtualTables;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2018年11月22日12:28:23
 */
public interface SysRoleVirtualMapper extends BaseMapper<SysRoleVirtualTables> {


    @Select(" select VIRTUAL_ID from sys_role_virtual_tables where ROLE_ID = #{id}")
    List<Long> findById(Long id);

    int deleteBatch(Long[] roleIds);

    @Delete("delete from sys_role_virtual_tables where VIRTUAL_ID = #{id}")
    void deleteVirtualTables(Integer id);
}
