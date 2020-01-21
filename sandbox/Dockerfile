FROM bitnami/minideb:buster

RUN apt-get update && apt-get install -y --no-install-recommends locales \
 && rm -rf /var/lib/apt/lists/* \
 && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc gcc-multilib g++ \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir /sandbox
RUN useradd -M -d /sandbox sandbox
RUN chown -R sandbox:sandbox /sandbox

RUN mkdir /opt/nitori/
COPY ./shared/catch.hpp /opt/nitori/catch.hpp
COPY ./shared/util.hpp /opt/nitori/util.hpp
COPY shared/processTest.hpp /opt/nitori/processTest.hpp
COPY ./shared/testing.hpp /opt/nitori/testing.hpp

RUN g++ \
    -I/opt/nitori/ \
    -std=c++2a \
    -c \
    /opt/nitori/testing.hpp \
    -o /opt/nitori/testing.hpp.gch \
    && rm /opt/nitori/*.hpp