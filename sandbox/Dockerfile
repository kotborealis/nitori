FROM bitnami/minideb:stretch

RUN apt-get update && apt-get install -y --no-install-recommends locales \
 && rm -rf /var/lib/apt/lists/* \
 && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8

ENV GCC_VERSION 6.3.0-4

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc=4:${GCC_VERSION} gcc-multilib=4:${GCC_VERSION} g++=4:${GCC_VERSION} \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir /sandbox
RUN useradd -M -d /sandbox sandbox
RUN chown -R sandbox:sandbox /sandbox

RUN mkdir /opt/nitori/
COPY ./shared/catch.hpp /opt/nitori/catch.hpp
COPY ./shared/hijack.hpp /opt/nitori/hijack.hpp
COPY ./shared/testing.hpp /opt/nitori/testing.hpp