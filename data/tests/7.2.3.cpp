#include "testing.hpp"

TEST_CASE("6.2.3") {
    SECTION("Example 1") {
        HIJACK_STDOUT();
        HIJACK_STDIN(
            "2 2\n"

            "1 2\n"
            "3 4\n"

            "1 2\n"
        );

        HIJACK_MAIN(0, 0);

        REQUIRE(
            nitori::trim(nitori::stdout.str())
            ==
            "3 4\n"
            "1 2\n"
        );
    }

    SECTION("Example 2") {
        HIJACK_STDOUT();
        HIJACK_STDIN(
            "2 2\n"

            "1 2\n"
            "3 4\n"

            "999 777\n"
        );

        HIJACK_MAIN(0, 0);

        REQUIRE(
            nitori::trim(nitori::stdout.str())
            ==
            "Error\n"
        );
    }
}