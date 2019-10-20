#include "testing.hpp"

TEST_CASE("6.2.1") {
    SECTION("Example 1") {
        HIJACK_STDOUT();
        HIJACK_STDIN(
            "1 2\n"
            "1 0\n"

            "2 2\n"
            "1 2 3 4\n"
        );

        HIJACK_MAIN(0, 0);

        REQUIRE(nitori::trim(nitori::stdout.str()) == "1 2");
    }

    SECTION("Example 2") {
        HIJACK_STDOUT();
        HIJACK_STDIN(
            "2 1\n"
            "1 0\n"

            "2 2\n"
            "1 2 3 4\n"
        );

        HIJACK_MAIN(0, 0);

        REQUIRE(nitori::trim(nitori::stdout.str()) == "Error");
    }
}