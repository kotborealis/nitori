FROM bitnami/minideb:unstable

RUN apt-get update && apt-get install -y --no-install-recommends locales \
 && rm -rf /var/lib/apt/lists/* \
 && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /sandbox
RUN useradd -M -d /sandbox sandbox
RUN chown -R sandbox:sandbox /sandbox
WORKDIR /sandbox

RUN mkdir -p /opt/nitori/
COPY ./shared/catch.hpp /opt/nitori/catch.hpp
COPY ./shared/util.hpp /opt/nitori/util.hpp
COPY shared/processTest.hpp /opt/nitori/processTest.hpp
COPY ./shared/testing.hpp /opt/nitori/testing.hpp
COPY ./shared/__unit_test.cpp /opt/nitori/__unit_test.cpp
COPY ./shared/__unit_test_main.cpp /opt/nitori/__unit_test_main.cpp

RUN g++ \
        -std=c++2a \
        -c \
        /opt/nitori/__unit_test.cpp \
        -o /opt/nitori/__unit_test.o \
    && g++ \
        -std=c++2a \
        -c \
        /opt/nitori/__unit_test_main.cpp \
        -o /opt/nitori/__unit_test_main.o \
    && objcopy \
        /opt/nitori/__unit_test_main.o \
        --redefine-sym \
        main=__NITORI_HIJACK_MAIN__ \
    && g++ \
        -std=c++2a \
        /opt/nitori/__unit_test.o /opt/nitori/__unit_test_main.o \
        -o /opt/nitori/unit_test

#RUN /opt/nitori/unit_test

#CMD /opt/nitori/unit_test

WORKDIR /opt/nitori
CMD bash

#RUN g++ \
#    -std=c++2a \
#    -c \
#    /opt/nitori/testing.hpp \
#    -o /opt/nitori/testing.hpp.gch \
#    && rm /opt/nitori/*.hpp