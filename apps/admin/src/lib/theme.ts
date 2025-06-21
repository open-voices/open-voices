import { createTheme } from "@mantine/core";
import "@fontsource-variable/ubuntu-sans-mono";
import "../assets/style.css";

export const theme = createTheme({
    primaryColor:  "dark",
    fontFamily:    "Ubuntu Sans Mono Variable, monospace",
    fontFamilyMonospace: "Ubuntu Sans Mono Variable, monospace",
    defaultRadius: "sm",
    headings:      {
        fontWeight: "500",
    },
    components:    {
        Card: {
            classNames: {
                root: "brutal-card hover:translate[-6px]",
            },
        },
        AppShell: {
            classNames: {
                navbar: "brutal-navbar",
            }
        },
        NavLink: {
            classNames: {
                root: "brutal-nav-link",
            }
        },
        Input: {
            classNames: {
                input: "brutal-input",
            }
        },
        Checkbox: {
            classNames: {
                input: "brutal-checkbox",
            }
        },
        Button: {
            classNames: {
                root: "brutal-button",
            },
        },
        Table: {
            classNames: {
                table: "brutal-table",
                tr: "brutal-table-row",
                td: "brutal-table-cell",
                th: "brutal-table-heading",
            },
        },
        Popover: {
            classNames: {
                dropdown: "brutal-popover",
                arrow: "brutal-popover-arrow",
            }
        },
        Pagination: {
            classNames: {
                control: "brutal-pagination-control",
            }
        }
    },
});