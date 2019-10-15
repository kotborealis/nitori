#include "testing.hpp"

TEST_CASE("cat") {
    SECTION("Writes stdin to stdout") {
        HIJACK_STDOUT();
        HIJACK_STDIN("qwerty123456");

        HIJACK_MAIN(0, 0);

        REQUIRE(hijack_stdout.str() == "qwerty123456");
    }
}