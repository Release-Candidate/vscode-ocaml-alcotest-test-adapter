(*******************************************************************************
    Some tests. *)

let%test "parse true" =
  Alcotest.(check bool) "parse true" true (Bool true = parse "true")

let%test "parse false" =
  Alcotest.(check bool) "parse false" true (Bool false = parse "false")

let%test "parse not true" =
  Alcotest.(check bool)
    "parse not true" true
    (Unop (Not, Bool true) = parse "not true")

let%test "parse not false" =
  Alcotest.(check bool)
    "parse not false" true
    (Unop (Not, Bool false) = parse "not false")

let%test "parse 1" = Alcotest.(check bool) "parse 1" true (Int 1 = parse "1")

let%test "parse 1.1" =
  Alcotest.(check bool) "parse 1.1" true (Float 1.1 = parse "1.1")

let%test "parse -1" =
  Alcotest.(check bool) "parse -1" true (Unop (Minus, Int 1) = parse "-1")

let%test "parse -1.1" =
  Alcotest.(check bool)
    "parse -1.1" true
    (Unop (Minus, Float 1.1) = parse "-1.1")

let%test "parse 11+11" =
  Alcotest.(check bool)
    "parse 11+11" true
    (Binop (Add, Int 11, Int 11) = parse "11+11")

let%test "parse not true" =
  Alcotest.(check bool)
    "parse not true" true
    (Binop (Add, Float 21., Float 21.2) = parse "21.+21.2")

let%test "parse 11-11" =
  Alcotest.(check bool)
    "parse 11-11" true
    (Binop (Subtr, Int 11, Int 11) = parse "11-11")

let%test "parse 21.-21.2" =
  Alcotest.(check bool)
    "parse 21.-21.2" true
    (Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2")

let%test "parse 11*11" =
  Alcotest.(check bool)
    "parse 11*11" true
    (Binop (Mult, Int 11, Int 11) = parse "11*11")

let%test "parse 21.*21.2" =
  Alcotest.(check bool)
    "parse 21.*21.2" true
    (Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2")

let%test "parse 11/-11" =
  Alcotest.(check bool)
    "parse 11/-11" true
    (Binop (Div, Int 11, Unop (Minus, Int 11)) = parse "11/-11")

let%test "parse 21./-21.2" =
  Alcotest.(check bool)
    "parse 21./-21.2" true
    (Binop (Div, Float 21., Unop (Minus, Float 21.2)) = parse "21./-21.2")

(* =============================================================================
   Error messages
*)
