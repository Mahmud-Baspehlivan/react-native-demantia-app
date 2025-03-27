export const theme = {
  colors: {
    primary: "#4285F4",
    secondary: "#34A853",
    error: "#EA4335",
    warning: "#FBBC05",
    success: "#34A853",
    background: "#F9F9F9",
    card: "#FFFFFF",
    text: "#212121",
    border: "#E0E0E0",
    placeholder: "#9E9E9E",
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    headerLarge: {
      fontSize: 24,
      fontWeight: "bold",
    },
    header: {
      fontSize: 20,
      fontWeight: "bold",
    },
    subheader: {
      fontSize: 18,
      fontWeight: "500",
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
      color: "#666666",
    },
  },
  roundness: {
    s: 4,
    m: 8,
    l: 16,
  },
};

export const getStyles = () => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.m,
    padding: theme.spacing.l,
    marginVertical: theme.spacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: theme.spacing.l,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.header,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.m,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.m,
    marginBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: "#f5f5f5",
  },
});
