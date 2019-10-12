#define CATCH_CONFIG_MAIN
#include "catch.hpp"

#include <iostream>

extern "C" {
    int __test_main(int argc, char** argv);
}

TEST_CASE("cat") {
    std::stringstream cout_buf;
    std::stringstream cerr_buf;

    std::cout.rdbuf(cout_buf.rdbuf());
    std::cerr.rdbuf(cerr_buf.rdbuf());

    SECTION("Writes stdin to stdout") {
        std::string data = "qwerty123456";

        std::stringstream cin_buf(data);
        std::cin.rdbuf(cin_buf.rdbuf());

        __test_main(0, 0);

        REQUIRE(cout_buf.str() == data);
    }
}