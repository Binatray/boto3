package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.VirtualTables;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 虚拟表 Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
public interface VirtualTablesMapper extends BaseMapper<VirtualTables> {

    @Select("SELECT a.* FROM virtual_tables a " +
            "LEFT JOIN sys_role_virtual_tables b ON a.ID = b.VIRTUAL_ID " +
            "LEFT JOIN sys_user_role c ON b.ROLE_ID = c.ROLE_ID where c.USER_ID = #{id}")
    List<VirtualTables> findByRole(Integer id);

    IPage<VirtualTables> pageList(Page<VirtualTables> page, @Param("params") Map<String, Object> params);

    IPage<VirtualTables> pageListAdmin(Page<VirtualTables> page);
}
