#define CATCH_CONFIG_MAIN
#include "catch.hpp"

#include <iostream>

#define main __test__main

#include "main.cpp"

TEST_CASE("Hello World") {
    std::stringstream cin_buf;
    std::stringstream cout_buf;
    std::stringstream cerr_buf;

    std::cin.rdbuf(cin_buf.rdbuf());
    std::cout.rdbuf(cout_buf.rdbuf());
    std::cerr.rdbuf(cerr_buf.rdbuf());

    SECTION("Writes \"Hello, World!\" to stdout") {
        __test__main(0, 0);
        REQUIRE(cout_buf.str() == "Hello, World!\n");
    }
}