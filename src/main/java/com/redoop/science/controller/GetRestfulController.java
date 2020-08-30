package com.redoop.science.controller;

import com.redoop.science.common.MlSql;
import com.redoop.science.service.IAnalysisService;
import com.redoop.science.utils.*;
import okhttp3.HttpUrl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.*;

/**
 * @Author: Admin
 * @Time: 2018年10月30日15:12:41
 * @Description:
 */
@RestController
@RequestMapping("/api")
public class GetRestfulController {

    Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private IAnalysisService analysisService;
    @Autowired
    private MlSql mlSql;

    @GetMapping("/analysis/{id}")
    @ResponseBody
    public Result<String> script(
            HttpServletRequest request, @PathVariable Integer id, @RequestParam Map<String, String> parms) throws Exception {


        String sql = null;

        Result<String> stringResult = new Result<>(ResultEnum.FAIL);
        String result = "";


        try {

            sql = analysisService.getId(id);
            for (String key : parms.keySet()) {

                sql = sql.replaceAll("&" + key, parms.get(key));

                /*System.out.println("key===="+key);
                System.out.println("parm.keySet()======="+parms.keySet());
                System.out.println("parm.get(key)======="+ parms.get(key));*/
            }

            String runSql = ParseSql.parse(sql);

            HttpUrl url = new HttpUrl.Builder()
                    .scheme("http")
                    .host(mlSql.getIp())
                    .port(mlSql.getPort())
                    .addPathSegments("run\\script")
                    .addQueryParameter("sql", runSql)
                    .build();
            String sqlResult = HttpClient.httpPost(url, "");
            result = sqlResult;
        } catch (IOException e) {
            e.printStackTrace();
        }
        logger.info("sql查询返回结果>>>>>>>" + result);
        if (JsonUtil.isJSONValid(result)) {
            stringResult = new Result<String>(ResultEnum.SECCUSS, result);
        } else {
            stringResult = new Result<String>(ResultEnum.FAIL, result);
        }
        return stringResult;
    }


}