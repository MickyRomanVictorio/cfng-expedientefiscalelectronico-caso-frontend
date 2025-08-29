function removeFalsyValues(obj: any) {
  return Object.entries(obj).reduce(
    (a: any, [k, v]) => (v ? ((a[k] = v), a) : a),
    {}
  );
}

export default {
  removeFalsyValues,
};
