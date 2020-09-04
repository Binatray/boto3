
package com.redoop.science.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.RealDb;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 实体数据源库 服务类
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
public interface IRealDbService extends IService<RealDb> {

    /**
     * 增加
     * @param realDb
     */
    void saveForm(RealDb realDb);

    /**
     * 查看库中的表信息
     */
   // List<RealDb> selectDatabase();

    /**
     * 根据数据源别名查询
     * @param nikeName
     * @return
     */
    RealDb findByNikeName(String nikeName);

    /**
     *
     * @param id
     * @return
     */
    List<RealDb> findByRole(Integer  id);

    /**
     *根据nikeName查id，查角色id，根据角色id查对应的真实库信息
     * @param params
     * @return
     */
    IPage<RealDb> pageList(Page<RealDb> page, Map params);

    IPage<RealDb> pageListAdmin(Page<RealDb> page);
}