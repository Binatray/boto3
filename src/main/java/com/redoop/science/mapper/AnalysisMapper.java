
package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.Analysis;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
@Mapper
public interface AnalysisMapper extends BaseMapper<Analysis> {

    @Select("select FINALLY_CODE from  analysis WHERE ID = #{id} ")
    String findByCode(Integer id);

    IPage<Analysis> pageList(Page<Analysis> page, @Param("params")Map<String, Object> params);

    IPage<Analysis> pageListAdmin(Page<Analysis> page);
}