package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.Analysis;
import com.redoop.science.entity.ProcessG6;
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
 * @since 2019年3月8日16:47:47
 */
@Mapper
public interface ProcessG6Mapper extends BaseMapper<ProcessG6> {

    @Select("select FINALLY_CODE from  analysis WHERE ID = #{id} ")
    String findByCode(Integer id);

    IPage<ProcessG6> pageList(Page<ProcessG6> page, @Param("params") Map<String, Object> params);

    IPage<ProcessG6> pageListAdmin(Page<ProcessG6> page);
}
