# Arcon-ElasticSearch

This API indexes and searches text data from log files using Elasticsearch.

# Observations

Elastic Search:
Path where Indexes are present: D:\elasticsearch-7.8.1-windows-x86_64\elasticsearch-7.8.1\data\nodes\0

Data used for testing:
File Size - 18.4 MB

Single Log Format :
{
    sul_id: '6433',
    sul_user_id: '23129',
    sul_ipaddress: '10.10.0.179[ARCOSDEVSVR4][005056B2C51E][1FABFBFF000206D7][VMware-4232dd2f672a12c6-341ded5e689a2943][ACM4.8.5.0]',
    sul_active_from: '2019-09-06 15:17:22.117000000',
    sul_active_till: '2019-09-06 15:39:15.743000000',
    sul_timestamped_on: '2019-09-06 15:17:22.117000000',
    sul_logout_flag: '',
    sul_UserName: 'cL8hboTmm29gara3FQk8qA==',
    sul_User_Display_Name: 'cL8hboTmm29gara3FQk8qA==',
    sul_User_Type: 'Admin',
    sul_User_Type_ID: 'True',
    sul_sessionstarttime_source: '',
    sul_sessionendtime_source: '',
    sul_host_region_timezone: '',
    sul_sessionfor: '',
    sul_connectiontype: '\r',
    file_name: 'testdata.txt'
}


Elastic Search: 
Indexing Duration : 13 mins 44 secs
Index Size: 48 MB (More than 3 times the data logs' initial size)



Batch the logs (Don't send individually, network is also not burdened with this approach)
implement sharding, don't keep all in one (make elastic search run in parallel)

Create Index Template of the fields we are gonna use (Avoids dynamic mapping)

Time Frequent Index Creation	
we can shard each field so that we can activate that shard if filled

Disable _source field: -> removes the orginal copy of JSON document
Remove the search fields which aren't used
skip the fields which are not needed to be indexed


We can measure performance of each query and then make decisions:
response = es.search(index="logs", body={
    "query": { "match_all": {} }
}, params={"profile": "true"})
print(response['profile'])


always use date ranges for faster search
we need to delete logs so that the logs don't become too big for indexing
remove old indexes too


Use Rollup Jobs:
If you have time-based indices, consider using Elasticsearch Rollup Jobs to summarize and reduce data in older indices.

Implement Pagination:
Search After API instead of using the from parameter. Search After can be more efficient for large result sets.

Force Merge:
Use the force merge API to optimize the index by reducing the number of segments. This can improve search performance and reduce disk space usage.


Bugs: 
fix the ip field for search string with spaces
fix the string field which has +=[]
fix the date fields to work for months and time