package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.RealDb;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 实体数据源库 Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */

@Mapper
public interface RealDbMapper extends BaseMapper<RealDb> {

    /**
     * 根据数据源别名查询
     * @param nikeName
     * @return
     */
    @Select("select NIKE_NAME from real_db where NIKE_NAME = #{NIKE_NAME}")
    RealDb findByNikeName(String nikeName);

    @Select("SELECT a.* FROM real_db a " +
            "LEFT JOIN sys_role_real_db b on a.ID = b.REAL_DB_ID " +
            "LEFT JOIN sys_user_role c on b.ROLE_ID = c.ROLE_ID " +
            "WHERE c.USER_ID =#{id} and a.ID  is not NULL")
    List<RealDb> findByUserId(Integer id);


    IPage<RealDb> findByRole(Page<RealDb> page, @Param("params")Map params);

    IPage<RealDb> pageListAdmin(Page<RealDb> page);
}
