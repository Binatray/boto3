
package com.redoop.science.utils;

import okhttp3.*;

import java.io.IOException;

/**
 * @Author: Alan
 * @Time: 2018/9/20 10:46
 * @Description:
 */
public class HttpClient {
    public static final MediaType type = MediaType.parse("application/x-www-form-urlencoded;charset=utf-8");
    public static final MediaType type_json = MediaType.parse("application/json;charset=UTF-8");
    public static final OkHttpClient httpClient = new OkHttpClient();
    //Get方法调用服务
    public static String httpGet(HttpUrl url) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .build();
        Response response = httpClient.newCall(request).execute();
        return response.body().string();// 返回的是string 类型
    }
    //Post方法调用服务
    public static String httpPost(HttpUrl url,String content) throws IOException{
        RequestBody requestBody = RequestBody.create(type_json,content);
        Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .build();
        Response response = httpClient.newCall(request).execute();
        return response.body().string();
    }

    public Object invokeEntry(HttpUrl url,String sql) throws IOException {
        url.newBuilder()
                /*  下面方法可为HttpUrl添加query部分内容，添加结果为：../../..?systemID = 系统id值&dishesID = 接口编号&data = 参数数据  */
                .addQueryParameter("sql", sql)
                .build();
        return HttpClient.httpGet(url);
    }

}