package com.redoop.science.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.SysRolePermission;
import com.redoop.science.entity.SysRoleRealDb;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author admin
 * @since 2018年11月21日15:10:10
 */
public interface ISysRoleRealDbService extends IService<SysRoleRealDb> {

    List<Long> queryReadDbIdList(Long id);

    int deleteBatch(Long[] longs);

    void deleteDb(Integer id);
}
