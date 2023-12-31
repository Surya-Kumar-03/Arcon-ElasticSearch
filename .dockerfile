FROM docker.elastic.co/elasticsearch/elasticsearch

ENV discovery.type=single-node
ENV network.host=0.0.0.0


EXPOSE 9200 9300

CMD ["elasticsearch"]
