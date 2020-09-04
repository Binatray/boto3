package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.redoop.science.entity.SysRoleViewsTables;
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
public interface SysRoleViewMapper extends BaseMapper<SysRoleViewsTables> {


    //@Select("select PERMISSION_ID from sys_role_permission where ROLE_ID = #{id}")
    @Select(" select VIEW_TABLES_ID from sys_role_views_tables where ROLE_ID = #{id}")
    List<Long> findById(Long id);



    int deleteBatch(Long[] roleIds);

    @Delete("delete from sys_role_views_tables  where VIEW_TABLES_ID = #{id}")
    void deleteViewsTables(Integer id);
}
